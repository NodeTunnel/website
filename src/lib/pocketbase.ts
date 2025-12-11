import PocketBase from "pocketbase";

const PB_URL = "http://localhost:8090";

export const pb = new PocketBase(PB_URL);

export const isLoggedIn = () => Boolean(pb.authStore?.isValid);

export const currentUser = () => pb.authStore?.model;
