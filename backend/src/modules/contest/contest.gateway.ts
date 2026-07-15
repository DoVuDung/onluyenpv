import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ContestService } from './contest.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ContestGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly contestService: ContestService) {}

  @SubscribeMessage('joinContest')
  async handleJoin(
    @MessageBody() data: { contestId: string },
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    void client.join(`contest:${data.contestId}`);
    const leaderboard = await this.contestService.getLeaderboard(data.contestId);
    client.emit('leaderboard:update', leaderboard);
  }

  async broadcastLeaderboardUpdate(contestId: string): Promise<void> {
    const leaderboard = await this.contestService.getLeaderboard(contestId);
    this.server.to(`contest:${contestId}`).emit('leaderboard:update', leaderboard);
  }
}
