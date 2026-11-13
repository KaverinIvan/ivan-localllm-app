import React, { useState, useRef, useEffect } from 'react';
import { Button, TextArea, Card, Spinner, useStyles2 } from '@grafana/ui';
import { GrafanaTheme2 } from '@grafana/data';
import { css } from '@emotion/css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const getStyles = (theme: GrafanaTheme2) => ({
  chatContainer: css`
    display: flex;
    flex-direction: column;
    height: 75vh;
    border: 1px solid ${theme.colors.border.weak};
    border-radius: ${theme.shape.radius.default};
    background: ${theme.colors.background.primary};
  `,
  messagesArea: css`
    flex: 1;
    overflow-y: auto;
    padding: ${theme.spacing(2)};
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing(2)};
  `,
  messageBubble: css`
    padding: ${theme.spacing(1.5)};
    border-radius: ${theme.shape.radius.default};
    max-width: 80%;
    word-wrap: break-word;
  `,
  userBubble: css`
    background: ${theme.colors.primary.main};
    color: ${theme.colors.primary.contrastText};
    align-self: flex-end;
  `,
  assistantBubble: css`
    background: ${theme.colors.background.secondary};
    color: ${theme.colors.text.primary};
    align-self: flex-start;
  `,
  inputArea: css`
    display: flex;
    gap: ${theme.spacing(1)};
    padding: ${theme.spacing(2)};
    border-top: 1px solid ${theme.colors.border.weak};
  `,
  markdownTable: css`
    table { border-collapse: collapse; width: 100%; margin-top: 10px; }
    th, td { border: 1px solid ${theme.colors.border.medium}; padding: 8px; }
    th { background: ${theme.colors.background.secondary}; }
  `
});

export const Chat = () => {
  const styles = useStyles2(getStyles);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/plugins/ivan-localllm-app/resources/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'your-model-name',
          messages: newMessages,
          stream: false
        }),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const data = await response.json();
      
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: data.choices[0].message.content 
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [...prev, { role: 'assistant', content: '❌ Ошибка при обращении к модели.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <div className={styles.chatContainer}>
        <div className={styles.messagesArea}>
          {messages.length === 0 && (
             <div style={{ textAlign: 'center', color: 'gray', marginTop: '20px' }}>
                Задайте вопрос по вашей инфраструктуре (Grafana, Prometheus, VictoriaMetrics).
             </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`${styles.messageBubble} ${
                msg.role === 'user' ? styles.userBubble : styles.assistantBubble
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className={styles.markdownTable}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          ))}
          {isLoading && (
            <div className={`${styles.messageBubble} ${styles.assistantBubble}`}>
               <Spinner inline /> <span style={{ marginLeft: '10px' }}>Qwen думает...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className={styles.inputArea}>
          <TextArea
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            placeholder="Например: Создай дашборд для метрик GPU..."
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            Отправить
          </Button>
        </div>
      </div>
    </Card>
  );
};
