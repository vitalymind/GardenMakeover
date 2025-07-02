import { Environment } from "./main";

declare global {
    interface Window {
        env: Environment

    }
}