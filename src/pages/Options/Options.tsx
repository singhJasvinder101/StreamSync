import React, { useEffect } from 'react';
import './Options.css';

interface Props {
  title: string;
}

const Options: React.FC<Props> = ({ title }: Props) => {
  useEffect(() => {

    navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    })
      .then(function (stream) {
        console.log("Permissions granted, here is the stream: ", stream);
        // chrome.runtime.sendMessage({ action: "mediaStream", stream: stream.id });

      })
      .catch(function (err) {
        console.error("Error accessing media devices: ", err);
      });
  }, [])

  return <div className="OptionsContainer">{title}

  </div>;
};

export default Options;
