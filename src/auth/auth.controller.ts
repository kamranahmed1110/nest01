import { 
    Controller, Post, Body, Get, Put, UseGuards, Request, UploadedFile, UseInterceptors 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UnauthorizedException } from '@nestjs/common';
import { FileService } from './file.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User registration' })
  @ApiBody({ type: RegisterUserDto })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid data' })
  @Post('register')
  @UseInterceptors(FileInterceptor('profilePicture', FileService.multerConfig))
  async register(
    @Body() registerDto: RegisterUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      registerDto.profilePicture = `/uploads/${file.filename}`;
    }
    return this.authService.register(registerDto);
  }

  @ApiOperation({ summary: 'User login and JWT token generation' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: 200, description: 'Successfully logged in, JWT token generated' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
  @Post('login')
  async login(@Body() loginDto: LoginUserDto) {
    return this.authService.login(loginDto);
  }

  @ApiOperation({ summary: 'Retrieve user profile (protected by JWT)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return req.user; 
  }

  @ApiOperation({ summary: 'Update user profile (protected by JWT)' })
  @ApiBearerAuth()
  @ApiBody({ type: UpdateProfileDto })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' })
  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('profilePicture', FileService.multerConfig))
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User is not authenticated');
    }

    const userId = req.user.id;

    if (file) {
      updateProfileDto.profilePicture = `/uploads/${file.filename}`;
    }

    return this.authService.updateProfile(userId, updateProfileDto);
  }
}
