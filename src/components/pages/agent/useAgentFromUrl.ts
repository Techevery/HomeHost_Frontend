// hooks/useAgentFromUrl.ts
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_DEV_BASE_URL || "https://homeyhost.ng/api";

interface AgentInfo {
  id: string;
  name: string;
  email: string;
  status: string;
  slug: string;
  phone_number: string;
  address: string;
  gender: string;
  profile_picture: string;
  bank_name: string;
  account_number: string;
  isVerified: boolean;
  personalUrl: string;
  next_of_kin_full_name: string;
  next_of_kin_email: string;
  accountBalance?: number;
  id_card?: string;
  createdAt?: string;
}

export const useAgentFromUrl = () => {
  const { personalUrl } = useParams<{ personalUrl: string }>();
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgentFromSlug = async () => {
      if (!personalUrl) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${API_BASE_URL}/api/v1/agent/${personalUrl}/profile`,
        );

        console.log("Agent profile response:", response.data);

        if (response.data && response.data.data) {
          setAgentInfo(response.data.data);
        } else if (response.data && response.data.result) {
          setAgentInfo(response.data.result);
        } else {
          throw new Error("Invalid agent data received");
        }
      } catch (err: any) {
        console.error("Failed to fetch agent from slug:", err);
        setError(err.response?.data?.message || "Failed to load agent profile");
      } finally {
        setLoading(false);
      }
    };

    fetchAgentFromSlug();
  }, [personalUrl]);

  return { agentInfo, loading, error };
};
