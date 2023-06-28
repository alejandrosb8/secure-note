import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  password: string;
}
export class GetNotePasswordDto {
  @IsNotEmpty({ message: 'No password provided' })
  @IsString()
  password: string;
}

export class UpdateNoteDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  content: string;
}
