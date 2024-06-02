
import './landing-speakerButton.css';
import { useState } from "react"

const SpeakerButton = () => {
  const [isMute, setIsMute] = useState(false);

  const handleClick = () => {
    setIsMute(!isMute);
  };

  return (
    <div onClick={handleClick} className={`speaker ${isMute ? "mute":""}`} >
      <img alt="Mute" src={"landing-speaker.svg"} />
      <span></span>
    </div>
  )
}

export default SpeakerButton;