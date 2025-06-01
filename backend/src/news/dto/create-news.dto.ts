import { IsString, MinLength } from 'class-validator';

export class CreateNewsDto {
  @IsString()
  @MinLength(3)
  title!: string;

  @IsString()
  @MinLength(10)
  content!: string;

  @IsString()
  category!: 'economy' | 'society' | 'science' | 'military';
}
