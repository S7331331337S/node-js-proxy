import {
  Actor,
  EmotionBehavior,
  EmotionStrength,
  InworldPacket,
  InworldConnectionService
} from '@inworld/nodejs-sdk';

import { Client } from './inworld/client';

class InworldConnector {

  private client: Client;
  private connection: InworldConnectionService;
  private queue: any[];

  constructor() {

    this.queue = [];

    const client = new Client({
      config: {
        capabilities: { audio: true, emotions: true },
      },
      onDisconnect: () => {
        console.error('❗ Inworld disconnected');
      },
      onMessage: onMessage
    });
    this.client = client;

    const connection = client.getConnection();
    this.connection = connection;

    var parent = this;

    function onMessage(packet: InworldPacket) {

        const { packetId } = packet;
        const i = packetId.packetId;
        const u = packetId.utteranceId;

        // TEXT
        if (packet.isText()) {
          const textEvent = packet.text;
          if (packet.routing.source.isPlayer) {
            if (textEvent.final) {
              parent.queue.push({
                type: 'text',
                final: textEvent.final,
                text: textEvent.text
              })
            }
          } else {
            parent.queue.push({
              type: 'text',
              source: renderActor(packet.routing.source),
              target: renderActor(packet.routing.target),
              final: textEvent.final,
              text: textEvent.text,
              i: i,
              u: u
            })
          }
        }

        // EMOTION
        if (packet.isEmotion()) {
          parent.queue.push({
            type: 'emotion',
            joy: packet.emotions.joy,
            fear: packet.emotions.fear,
            trust: packet.emotions.trust,
            surprise: packet.emotions.surprise,
            behavior: getBehavior(packet.emotions.behavior),
            strength: getStrength(packet.emotions.strength)
          })
        }

        // CUSTOM
        if (packet.isCustom()) {
          parent.queue.push({
            type: 'custom',
            name: packet.custom.name
          })
        }

        function renderEventRouting(packet: InworldPacket) {
          return `${renderActor(packet.routing.source)} to ${renderActor(
            packet.routing.target,
          )}`;
        };

        function renderActor(actor: Actor) {
          if (actor.isPlayer) return 'Player';
          else if (actor.isCharacter) return `Character(${actor.name})`;
          else return 'Unknown';
        };

        function getBehavior(behavior: EmotionBehavior) {
          switch (true) {
            case behavior.isNeutral():
              return 'Neutral';
            case behavior.isDisgust():
              return 'Disgust';
            case behavior.isContempt():
              return 'Contempt';
            case behavior.isBelligerence():
              return 'Belligerence';
            case behavior.isDomineering():
              return 'Domineering';
            case behavior.isCriticism():
              return 'Criticism';
            case behavior.isAnger():
              return 'Anger';
            case behavior.isTension():
              return 'Tension';
            case behavior.isTenseHumor():
              return 'TenseHumor';
            case behavior.isDefensiveness():
              return 'Defensiveness';
            case behavior.isWhining():
              return 'Whining';
            case behavior.isSadness():
              return 'Sadness';
            case behavior.isStonewalling():
              return 'Stonewalling';
            case behavior.isInterest():
              return 'Interest';
            case behavior.isValidation():
              return 'Validation';
            case behavior.isAffection():
              return 'Affection';
            case behavior.isHumor():
              return 'Humor';
            case behavior.isSurprise():
              return 'Surprise';
            case behavior.isJoy():
              return 'Joy';
          }
        };

        function getStrength (strength: EmotionStrength) {
          switch (true) {
            case strength.isWeak():
              return 'Weak';
            case strength.isStrong():
              return 'Strong';
          }
        };

    }

    console.log('   Inworld Connector Success')

  }

  flushQueue() {
    return this.queue.splice(0, this.queue.length);
  }

  getClient() {
    return this.client;
  }

  getConnection() {
    return this.client.getConnection();
  }

}

export default InworldConnector
