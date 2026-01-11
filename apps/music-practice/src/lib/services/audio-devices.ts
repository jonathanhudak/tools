import { AudioManager } from '../input/audio-manager';

export async function fetchAudioInputDevices(): Promise<MediaDeviceInfo[]> {
  return AudioManager.getAudioInputDevices();
}
