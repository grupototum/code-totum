import React from 'react';
import { cn } from './../../lib/utils';

interface MessageBubbleProps {
  content: string;
  role: 'user' | 'assistant';
  timestamp?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  role,
  timestamp,
}) => {
  const isUser = role === 'user';

  return (
    <div className={cn('flex mb-4', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-xs lg:max-w-md px-4 py-2 rounded-lg',
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-slate-200 text-slate-900'
        )}
      >
        <p className="text-sm break-words">{content}</p>
        {timestamp && (
          <p className={cn('text-xs mt-1', isUser ? 'text-blue-100' : 'text-slate-500')}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
};
