import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString, IsUUID } from "class-validator";
import { postStatus } from "src/config/enums";

export class CreatePostDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    body: string

    @ApiProperty()
    @IsString()
    @IsEnum(postStatus)
    status: string
}
