import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Delete,
  Patch,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import {
  CreateNoteDto,
  GetNotePasswordDto,
  UpdateNoteDto,
} from './dto/note.dto';
import { ValidationPipe } from '@nestjs/common';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}
  @Get()
  getAllNotes() {
    return this.notesService.getAllNotes();
  }

  @Get(':id')
  getOneNoteByIdAndPassword(
    @Param('id') id: string,
    @Query(new ValidationPipe({ transform: true })) query: GetNotePasswordDto,
  ) {
    return this.notesService.getOneNoteByIdAndPassword(id, query.password);
  }
  @Post()
  createNote(@Body() createNoteDto: CreateNoteDto) {
    return this.notesService.createNote(
      createNoteDto.title,
      createNoteDto.content,
      createNoteDto.password,
    );
  }

  @Delete(':id')
  deleteNoteById(
    @Param('id') id: string,
    @Query(new ValidationPipe({ transform: true })) query: GetNotePasswordDto,
  ) {
    return this.notesService.deleteOneNoteByIdAndPassword(id, query.password);
  }

  @Patch(':id')
  updateNoteById(
    @Param('id') id: string,
    @Query(new ValidationPipe({ transform: true })) query: GetNotePasswordDto,
    @Body() updateNoteDto: UpdateNoteDto,
  ) {
    return this.notesService.updateOneNoteByIdAndPassword(
      id,
      query.password,
      updateNoteDto.title,
      updateNoteDto.content,
    );
  }
}
