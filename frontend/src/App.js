import { Amplify } from "aws-amplify";

import { Authenticator, Button, Tabs } from "@aws-amplify/ui-react";
import "./styles.css";

import HeaderComponent from "./components/Header/HeaderComponent";
import ChatbotComponent from "./components/Chatbot/ChatbotComponent";

import awsconfig from "./aws-exports";
import customconfig from "./custom.configuration.json";
import React, { useState } from "react";

async function initConfiguration() {
  await Amplify.configure({
    ...awsconfig,
    ssr: true
  });

  const apiName = customconfig.apiName;
  const existingConfig = await Amplify.getConfig();

  return await Amplify.configure({
    Auth: {
      ...existingConfig.Auth,
    },
    API: {
      REST: {
        [apiName]: {
          endpoint: customconfig.apiEndpoint,
        },
      },
    },
  });
}
await initConfiguration();

const App = () => {
  const [tab, setTab] = useState("1");

  return (
    <Authenticator hideSignUp={true}>
      {({ signOut, user }) => (
        <main>
          <HeaderComponent />
          <Tabs
            value={tab}
            onValueChange={(tab) => setTab(tab)}
            indicatorPosition="top"
            items={[
              {
                label: "AI Assistant",
                value: "1",
                content: <ChatbotComponent />,
              },
            ]}
          />
          <Button
            color="white"
            borderColor={"purple"}
            backgroundColor={"purple"}
            onClick={signOut}
          >
            Sign out
          </Button>
        </main>
      )}
    </Authenticator>
  );
};
export default App;
