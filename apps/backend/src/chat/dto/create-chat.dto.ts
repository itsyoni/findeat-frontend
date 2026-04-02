export class CreateChatDto {
  participantIds!: string[];
  isGroup?: boolean;
  name?: string;
}
