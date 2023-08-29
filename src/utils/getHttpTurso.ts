import axios from "axios";
export const connectToTursoDB = async () => {
  const token = process.env.TOKEN_DB!; // Replace with your token
  const url = "https://travelblog-hoanglinhptit.turso.io";

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("Request URL:", response.config.url);
    console.log("Request Headers:", response.config.headers);
    console.log("Response Status Code:", response.status);
    console.log("Response Headers:", response.headers);
    console.log("Response Data:", response.data);
    // Process the response or return it
    console.log("reponse ", response);

    return response.data;
  } catch (error) {
    // Handle errors
    console.error("Error connecting to Turso DB:", error);
    throw error;
  }
};
