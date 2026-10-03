import { createServerFn } from "@tanstack/react-start";
import type { SignInChoice } from "./house";

/** Which sign-in buttons are live, without sending client secrets to the browser. */
export const loadSignInChoices = createServerFn({ method: "GET" }).handler(async (): Promise<SignInChoice[]> => {
  const { signInChoices } = await import("./house.server");
  return signInChoices();
});
