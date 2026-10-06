import axios from "axios";

let cachedAccessToken: string | null = null;
let accessTokenExpiresAt = 0;

export const getGettyAccessToken = async (): Promise<string> => {
  if (
    cachedAccessToken &&
    Date.now() < accessTokenExpiresAt
  ) {
    return cachedAccessToken;
  }

  const apiKey = process.env.GETTY_API_KEY || 'f3ytg2zzar8y4bdu4uqw7quk';
  const apiSecret = process.env.GETTY_API_SECRET || 'TRp3pR9NpvuiJCv4rUVh';

  if (!apiKey || !apiSecret) {
    throw new Error("Credenziali Getty mancanti");
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: apiKey,
    client_secret: apiSecret,
  });

  const response = await axios.post(
    "https://api.gettyimages.com/oauth2/token",
    body,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  const {
    access_token,
    expires_in,
  } = response.data;

  if (!access_token) {
    throw new Error("Getty non ha restituito un access token");
  }

  cachedAccessToken = access_token;

  accessTokenExpiresAt =
    Date.now() + (expires_in - 60) * 1000;

  return cachedAccessToken;
};

export const downloadGettyImage = async (
  downloadUrl: string
): Promise<Buffer> => {
  const accessToken = await getGettyAccessToken();

  const response = await axios.post(
    downloadUrl,
    null,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Api-Key": process.env.GETTY_API_KEY || 'f3ytg2zzar8y4bdu4uqw7quk',
      },

      responseType: "arraybuffer",
    }
  );

  if (response.headers["content-type"] !== "image/jpeg") {
    throw new Error(
      `Getty ha restituito un content-type inatteso: ${response.headers["content-type"]}`
    );
  }

  return Buffer.from(response.data);
};
