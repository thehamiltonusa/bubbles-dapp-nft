import React from 'react';
import { Box, Button } from '@chakra-ui/react';
import { dynamic } from '../../state';
import Popover from '../Common/Popover';
import UrlInput from '../Common/UrlInput';
import Ding from '../Common/Ding';
import { ImageIcon, LandscapeIcon, RightArrowIcon } from '../Common/Icons';

import IPFS from 'ipfs-http-client';
const ipfs = new IPFS({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https"
});
const ImageSetter = ({ type, image, switchToImage }) => {
  const Picker = () => (
    <Ding
      label="Image"
      Icon={ImageIcon}
      isSelected={type === 'image'}
      activeComp={<LandscapeIcon color="primary" />}
    />
  );
  const Content = ({ close }) => (
    <Box p="3" textAlign="center">
      <input type='file' onChange={async (e) => {
        console.log(e.target.files[0]);
        const reader = new FileReader();
        reader.onload = async function(f) {
          // The file's text will be printed here
          //console.log(reader.result);
          //const res = await ipfs.add(reader.result);
          console.log(reader.result)
          switchToImage(reader.result);
          close();
        };
        //reader.readAsArrayBuffer(e.target.files[0]);
        reader.readAsDataURL(e.target.files[0]);
      }
    }
      accept="image/jpg, image/jpeg, image/png" />
    </Box>
  );
  return (
    <Popover props={{ bg: 'red' }} label="Set image" trigger={<Picker />}>
      {(close) => <Content close={close} />}
    </Popover>
  );
};

export default dynamic(ImageSetter, ['image', 'type']);
