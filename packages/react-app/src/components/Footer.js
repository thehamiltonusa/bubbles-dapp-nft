/* eslint-disable react/jsx-wrap-multilines */
import { Box, Link, Text, Button, Center, HStack,Image } from '@chakra-ui/react';
import React from 'react';
import { dynamic } from '../state';
import Modal from './Common/Modal';
import {
  LoIcon,
  SoundIcon,
  SoundOffIcon,
  GithubIcon,
  UserIcon,
  CopyrightIcon,
  CreditsIcon,
} from './Common/Icons';
import Credits from './Misc/Credits';
import SourceCode from './Misc/SourceCode';
import ThemeSwitch from './ThemeSwitch';
import { TwitterIcon } from './Common/Icons';

const Footer = ({ toggleSound, playSound }) => (
  <Center my="6">
    <HStack
      spacing="10px"
      fontSize="sm"
      flexDirection={{ base: 'column-reverse', lg: 'row' }}
    >
      <Button
        variant="silent"
        leftIcon={<CopyrightIcon fontSize="lg" />}
        aria-label="Toggle Theme"
      >
        Copyright 2021
      </Button>

      <Modal
        title="Source code & Libraries"
        size="md"
        src={
          <Button
            variant="silent"
            leftIcon={<GithubIcon fontSize="lg" />}
            aria-label="Source code"
          >
            Source code
          </Button>
        }
      >
        <Box>
          <SourceCode />
        </Box>
      </Modal>

      <Modal
        title="Credits"
        size="md"
        src={
          <Button
            variant="silent"
            leftIcon={<CreditsIcon fontSize="lg" />}
            aria-label="Credits"
          >
            Credits
          </Button>
        }
      >
        <Box>
          <Credits />
        </Box>
      </Modal>
      <LoIcon />
      <Button
        variant="silent"
        leftIcon={<UserIcon fontSize="lg" />}
        target="_blank"
        as={Link}
        href="https://github.com/thehamiltonusa"
      >
        thehamiltonusa
      </Button>
      <Button
        variant="silent"
        leftIcon={<Image boxSize="20px" src="data:image/png;base64,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"/>
        }
        target="_blank"
        as={Link}
        href="https://t.me/uniquebubbles"
      >
        Telegram
      </Button>
      <Box as={Text}>
        <Button
          href="https://twitter.com/BubblesDAPP"
          target="_blank"
          as={Link}
          variant="heavy"
          leftIcon={<TwitterIcon fontSize="18px" />}
          aria-label="Twitter"
        >
          Twitter
        </Button>
      </Box>
      <Button
        variant="silent"
        leftIcon={(() => {
          if (!playSound) return <SoundOffIcon fontSize="lg" />;
          return <SoundIcon fontSize="lg" />;
        })()}
        aria-label="Toggle Theme"
        onClick={toggleSound}
      >
        Toggle sound
      </Button>
      <Box as={Text}>
        <ThemeSwitch />
      </Box>
    </HStack>
  </Center>
);

export default dynamic(Footer, ['playSound']);
