import { fetchAuthSession } from "@aws-amplify/auth";

export async function fetchAuthToken() {
    const { accessToken } = (await fetchAuthSession()).tokens ?? {};
    return accessToken;
}