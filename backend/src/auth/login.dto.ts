import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Kullanıcı adı boş bırakılamaz.' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Şifre boş bırakılamaz.' })
  @MinLength(4, {
    message: 'Şifre en az 4 karakter olmalıdır.',
  })
  password: string;
}