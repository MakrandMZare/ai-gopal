import Ticket from "../../models/ticket.js";
import analyzeTicket from "../../utils/aigop.js";
import user from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendmail } from "../../utils/mailer.js";
import { inngest } from "../client";

export const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;
      //fetch ticket from DB
      const ticket = await step.run("fetch-ticket", async () => {
        const ticketObject = await Ticket.findById(ticketId);
        if (!ticket) {
          throw new NonRetriableError("Ticket not found");
        }
        return ticketObject;
      });
      await step.run("update-ticket-status", async () => {
        await Ticket.findByIdAndUpdate(ticket._id, {
          status: "TODO",
        });
        const aiResponse = await analyzeTicket(ticket);

        const relatedskills = await step.run("ai-processing", async () => {
          let skills = [];
          if (aiResponse) {
            await Ticket.findByIdAndUpdate(ticket._id, {
              priority: ["low", "medium", "high"].includes(aiResponse.priority)
                ? "medium"
                : aiResponse.priority,
              helpfulNotes: aiResponse.helpfulNotes,
              status: "IN_PROGRESS",
              relatedSkills: aiResponse.relatedSkills,
            });
            skills = aiResponse.relatedSkills;
          }
          return skills;
        });
      });

      const moderator = await step.run("assign-moderatot", async () => {
        let user = await User.findOne({
          role: "moderator",
          skills: {
            $elemMatch: {
              $regex: relatedskills.join("|"),
              $option: "i",
            },
          },
        });
        if (!user) {
          user = await User.findOne({
            role: "admin",
          });
        }
        await Ticket.findByIdAndUpdate(ticket._id, {
          assignTo: user?._id || null,
        });
        return user;
      });
      await step.run("send-email-notification", async () => {
        if (moderator) {
          const finalTicket = await Ticket.findById(ticket._id);
          await sendmail(
            moderator.email,
            "Ticket Assigned",
            `A new ticket id assigned to you ${finalTicket.title}`
          );
        }
      });
      return { success: true };
    } catch (error) {
      console.error("Error running the step", err.message);
      success(false);
    }
  }
);
