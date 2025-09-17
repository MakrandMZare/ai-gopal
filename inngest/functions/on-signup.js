import user from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendmail } from "../../utils/mailer.js";
import { inngest } from "../client";

export const onUserSignup = inngest.createFunction(
  { id: "on-user-signup", retries: 2 },
  { event: "user/signup" },
  async ({ event, step }) => {
    try {
      const { email } = event.data;
      const user = await step.run("get-user-email", async () => {
        const userObject = await user.findOne({ email });
        if (!userObject) {
          throw new NonRetriableError("User nolonger exists in our database");
        }
        return userObject;
      });

      await step.run("send-welcoome-email", async () => {
        const subject = `Welcome to the App`;
        const message = `Hi,
        \n\n
        Thanks for signing up. We are glad to have you onboard!
        `;
        await sendmail(user.email, subject, message);
      });
      return { success: true };
    } catch (error) {
      console.error("Error running step", error.message);
      return { success: false };
    }
  }
);
