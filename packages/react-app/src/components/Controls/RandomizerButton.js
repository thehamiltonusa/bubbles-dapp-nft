/* eslint-disable import/no-absolute-path */
/* eslint-disable import/no-unresolved */
import React from 'react';
import { Button } from '@chakra-ui/react';
import useSound from 'use-sound';
import boopSfx from '../../spring.mp3';

import { createRandomBlob } from '../../utils/blob.utils';
import { dynamic } from '../../state';

const RandomizerButton = ({ playSound }) => {
  const [play] = useSound(boopSfx, { volume: 0.5 });
  return (
    <Button
      onClick={() => {
        if (playSound) play();
        createRandomBlob();
      }}

      variant="main"
      style={{backgroundColor: "#5f5ff9"}}
    >
      Change bubble
    </Button>
  );
};
export default dynamic(RandomizerButton, ['playSound']);
