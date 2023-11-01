/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useRef, useMemo, useState } from 'react';
import './styles.css';
import { component } from '@hubai/core';
import {
  IBrainClientManager,
  LocalBrain,
  getCurrentUtcDate,
} from '@hubai/core';
import { ImageCreatorMessage } from '../models/imageCreatorState';
import usePersistentState from '../hooks/persistentState';
import generateUniqueId from '../utils/uniqueId';
import { debounce } from '../utils/debounce';

const {
  Icon,
  Pane,
  Select,
  SplitPane,
  Option,
  Input,
  Chat,
  Message,
  ChatInput,
  ChatAction,
} = component;

export type Props = {
  id: string;
  availableBrains: LocalBrain[];
  brainClientManager: IBrainClientManager;
  name: string;
  onChangeName: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

function getFileSrc(file: Buffer | string, mimeType: string) {
  if (typeof file === 'string') {
    // Url
    if (file.startsWith('http')) return file;

    // base64
    return `data:${mimeType};base64,${file}`;
  }

  // TODO: Convert buffer to base64 img
  return `data:${mimeType};base64,${file.toString('base64')}`;
}

function ImageCreatorView({
  id,
  availableBrains,
  brainClientManager,
  name,
  onChangeName,
}: Props) {
  const chatInputRef = useRef<component.ChatInputApi>();
  const [nameInput, setNameInput] = useState<string>(name);
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = usePersistentState<ImageCreatorMessage[]>(
    [],
    `imageCreator.${id}.messages`
  );

  const [selectedBrain, setSelectedBrain] = usePersistentState<
    LocalBrain | undefined
  >(undefined, `imageCreator.${id}.selectedBrain`);

  const debounceChangeName = useMemo(
    () => debounce(onChangeName, 1000),
    [onChangeName]
  );

  const setApiRef = useCallback((api: component.ChatInputApi) => {
    chatInputRef.current = api;
  }, []);

  const pushMessage = useCallback(
    (message: ImageCreatorMessage) => {
      messages.unshift(message);
      setMessages([...messages]);
    },
    [messages, setMessages]
  );

  const onSubmit = useCallback(() => {
    if (loading) return;

    setLoading(true);
    const prompt = chatInputRef.current?.getValue();
    if (!selectedBrain || !prompt) {
      setLoading(false);
      return;
    }

    const brain = brainClientManager.getClient(selectedBrain!.id);
    if (!brain) {
      setLoading(false);
      return;
    }

    chatInputRef.current?.setValue('');

    brain.imageGeneration
      ?.generateImage([
        {
          role: 'user',
          sentAt: getCurrentUtcDate(),
          value: prompt,
          expectedResponseType: 'base64',
        },
      ])
      .then(async (res) => {
        const files = res.attachments?.map((a) => ({
          id: a.fileName ?? generateUniqueId(),
          fileSrc: getFileSrc(a.data, a.mimeType),
          attachmentType: a.fileType as any,
          mimeType: a.mimeType,
          size: '',
          name: a.fileName ?? 'Image',
        }));
        pushMessage({
          id: generateUniqueId(),
          prompt: !res.attachments?.length
            ? `${prompt}: \n ${res.result}`
            : prompt,
          files: files ?? [],
        });
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [brainClientManager, selectedBrain, pushMessage, loading]);

  const onChatAction = useCallback(
    (action: component.ChatAction) => {
      if (action === ChatAction.sendMessage) {
        onSubmit();
      }
    },
    [onSubmit]
  );

  const [splitPanePos, setSplitPanePos] = useState<string[] | number[]>([
    '20%',
    'auto',
  ]);

  const onCapabilityBrainChanged = useCallback(
    (brain: LocalBrain) => {
      setSelectedBrain(brain);
    },
    [setSelectedBrain]
  );

  return (
    <div className="image-creator-container">
      <div className="header-container">
        <Input
          placeholder="Creation Name"
          value={nameInput}
          onChange={(e) => {
            setNameInput(e.target.value);
            debounceChangeName(e);
          }}
        />
        <div>
          <label htmlFor="brain-selector">Select the brain:</label>
          <Select
            id="brain-selector"
            value={selectedBrain?.id ?? ''}
            onSelect={(e, option) =>
              onCapabilityBrainChanged(
                availableBrains.find((b) => b.id === option!.value)!
              )
            }
            placeholder="Select the Brain"
          >
            {availableBrains.map((brain) => (
              <Option
                key={`option-${brain.id}`}
                value={brain.id}
                name={brain.displayName}
                description={brain.description}
              >
                {brain.displayName}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      <div style={{ height: '90%', width: '100%' }}>
        <SplitPane
          sizes={splitPanePos}
          split="horizontal"
          onChange={setSplitPanePos}
        >
          <Pane minSize="10%" maxSize="50%">
            <Chat.InteractionContainer>
              <ChatInput id={id} onAction={onChatAction} onApiRef={setApiRef} />
              <Chat.Actions>
                <Chat.Action className="send-button" onClick={onSubmit}>
                  <Icon type={loading ? 'loading~spin' : 'send'} />
                </Chat.Action>
              </Chat.Actions>
            </Chat.InteractionContainer>
          </Pane>
          <Pane minSize="50%" maxSize="90%">
            <Chat.List
              messagesCount={messages.length}
              onMessageScrollBehavior="scrollToTop"
            >
              {messages.map((message) => (
                <Message.Root key={message.id} messageType="response">
                  <Message.Content>
                    <Message.Text>{message.prompt}</Message.Text>
                  </Message.Content>

                  <Message.Attachments data={message.files} />
                </Message.Root>
              ))}
            </Chat.List>
          </Pane>
        </SplitPane>
      </div>
    </div>
  );
}

export default ImageCreatorView;
