import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({
  name: 'song_data',
})
export class SongData {
  @PrimaryColumn()
  sond_id: string;

  @Column()
  lyric_id: string;

  @Column()
  artists: string;

  @Column()
  title: string;

  @Column({
    type: 'bigint'
  })
  playtime: number;
}