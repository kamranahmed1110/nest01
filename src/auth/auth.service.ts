import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Register User
  async register(registerDto: RegisterUserDto) {
    const { username, email, password } = registerDto;
    const hashedPassword = await bcrypt.hash(password, 10); 
    const user = this.userRepository.create({ username, email, password: hashedPassword });
    await this.userRepository.save(user);
    return this.removePassword(user);
  }

  // Login User
  async login(loginDto: LoginUserDto) {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { userId: user.id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    return { access_token: token };
  }

  // Get User Profile
  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return this.removePassword(user);
  }

  // Update User Profile
  async updateProfile(userId: number, updateProfileDto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const { username, email, password, profilePicture } = updateProfileDto;

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10); 
    if (profilePicture) user.profilePicture = profilePicture;

    await this.userRepository.save(user);
    return this.removePassword(user);
  }
  private removePassword(user: User) {
    const userCopy = { ...user }; 
    delete userCopy.password;
    return userCopy;
  }
}
