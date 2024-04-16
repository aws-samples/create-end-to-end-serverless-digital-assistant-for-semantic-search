import { Image, useTheme, Flex, View } from "@aws-amplify/ui-react";
import { restApiAdapter } from "../Utils/ApiAdapter";
import { bedrockAdapter } from "../Utils/LLMAdapter";

import React, { useEffect, useState, useRef } from "react";
import { getCurrentUser } from "aws-amplify/auth";

import chatbotIcon from "./chatbot_icon.png";

const ChatbotComponent = () => {
  const { tokens } = useTheme();
  const [state, setState] = useState("");
  const [chatbotIconState] = useState(
    <Image
      src={chatbotIcon}
      alignSelf="stretch"
      objectFit="initial"
      objectPosition="50% 50%"
      backgroundColor={tokens.colors.purple[40]}
      height="100%"
      width="100%"
      opacity="100%"
      borderRadius={tokens.radii.sq}
    />
  );
  const initialAssistantMessage = "How can I help you today?";
  const [chatState, setChatState] = useState(
    chatAssistantMessageRow(initialAssistantMessage)
  );
  const chatArea = useRef();
  const [chatConversationId, setChatConversationId] = useState();
  const [chatLastMessageId, setChatLastMessageId] = useState();
  const [chatSessionId, setChatSessionId] = useState();
  const LLMOptions = [bedrockAdapter]
  const [LLMOption] = React.useState(LLMOptions[0]);
  const apiAdapter = configureRestApiAdapter(LLMOption);

  function configureRestApiAdapter(llmOption) {
    restApiAdapter.configure(llmOption)
    return restApiAdapter;
  }

  function chatAssistantMessageSourceRow(assistantMessageSources) {
    if (
      !Array.isArray(assistantMessageSources) ||
      assistantMessageSources.length <= 0
    )
      return;

    const assistantMessageSourceRender = assistantMessageSources.map(
      (item, index) => {
        return (
          <div key={index}>
            <i>
              <p>
                Source {index + 1}: {item.location}
              </p>
              <p>{item.snippet}</p>
            </i>
          </div>
        );
      }
    );

    return (
      <details>
        <summary>
          <b>
            <i>Sources</i>
          </b>
        </summary>
        {assistantMessageSourceRender}
      </details>
    );
  }

  function chatAssistantMessageRow(assistantMessage, assistantMessageSources) {
    var assistantMessageSourceList = chatAssistantMessageSourceRow(
      assistantMessageSources
    );

    return (
      <>
        <table className="chatRow">
          <tbody>
            <tr>
              <td className="chatIconMessage">{chatbotIconState}</td>
              <td className="chatMessage">
                <b> Assistant: </b> {assistantMessage}
                {assistantMessageSourceList}
              </td>
            </tr>
          </tbody>
        </table>
      </>
    );
  }

  function chatUserMessageRow(userMessage) {
    return (
      <p>
        <b> User: </b>
        {userMessage}
        <br />
      </p>
    );
  }

  useEffect(() => {
    const currentChatArea = chatArea.current;
    currentChatArea.scrollTop = currentChatArea.scrollHeight;
  });

  async function submitQuery(userId, event) {
    const query = {
      prompt: state,
      userId: userId,
      conversationId: chatConversationId,
      messageId: chatLastMessageId,
      sessionId: chatSessionId
    }
    console.log(query)
    const response = await apiAdapter.submitPrompt(query);
    console.log(response)
    setChatConversationId(response.conversationId);
    setChatLastMessageId(response.lastMessageId)
    setChatSessionId(response.sessionId);
    const systemMessage = response.systemMessage;
    const systemMessageSources = response.systemMessageSources;
    const systemChatbotMessage = chatAssistantMessageRow(
      systemMessage,
      systemMessageSources
    );
    return systemChatbotMessage
  }

  async function handleSubmit(event) {
    console.log(event)
    const userChatbotMessage = chatUserMessageRow(state);
    const chatbotMessage = (
      <>
        {chatState}
        {userChatbotMessage}
      </>
    );
    setChatState(chatbotMessage);
    setState("");
    event.preventDefault();

    const { username } = await getCurrentUser();
    var systemChatbotMessage = {};

    try {
      systemChatbotMessage = await submitQuery(username, event);
      const chatbotState = (
        <>
          {chatbotMessage}
          {systemChatbotMessage}
        </>
      );

      setChatState(chatbotState);
    } catch (e) {
      console.error("Request failed", e);
      return;
    }
  }

  async function handleChange(event) {
    setState(event.target.value);
  }

  return (
    <Flex
      direction="column"
      gap="1rem"
      backgroundColor={tokens.colors.purple[20]}
      alignItems="center"
    >
      <div id="chatbot-chat" className="chatbotArea">
        <div id="chatbot-messages" className="chatbotTextArea" ref={chatArea}>
          {chatState}
        </div>
      </div>
      <form onSubmit={handleSubmit} className="chatbotArea">
        <input
          type="text"
          placeholder="Ask me anything..."
          value={state}
          onChange={handleChange}
        ></input>
      </form>
      <View height="10px" />
    </Flex>
  );
};
export default ChatbotComponent;
