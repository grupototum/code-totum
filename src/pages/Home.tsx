import React from 'react';
import { CodeHubLayout } from './../../components/layout/CodeHubLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './../../components/ui/card';

export const Home: React.FC = () => {
  const features = [
    {
      title: 'Ada',
      description: 'AI-powered code analysis and suggestions',
      icon: '🤖',
    },
    {
      title: 'Claudio',
      description: 'Claude API integration for advanced assistance',
      icon: '✨',
    },
    {
      title: 'Craudio',
      description: 'Local Ollama model support',
      icon: '🎵',
    },
  ];

  return (
    <CodeHubLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to CodeHub</h1>
          <p className="text-muted-foreground">
            Your AI-powered coding assistant. Choose a tool to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl mb-2">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Click to explore this feature
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Select one of the tools above to begin. Each tool provides unique capabilities:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Configure your API keys in Settings</li>
              <li>Start a conversation with your chosen AI</li>
              <li>Get code suggestions and explanations</li>
              <li>Save and manage your conversations</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </CodeHubLayout>
  );
};
