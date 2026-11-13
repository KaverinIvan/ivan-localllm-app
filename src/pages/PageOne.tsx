import React from 'react';
import { Chat } from '../components/Chat';
import { PluginPage } from '@grafana/runtime';

function PageOne() {
  return (
    <PluginPage>
      <Chat />
    </PluginPage>
  );
}

export default PageOne;
