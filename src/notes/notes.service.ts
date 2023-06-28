import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createCipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import * as bcrypt from 'bcrypt';
import {
  InvalidPasswordException,
  NoteNotFoundException,
} from './notes.exception';

async function EncryptText(content: string, password: string) {
  const iv = randomBytes(16);
  const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
  const cipher = createCipheriv('aes-256-ctr', key, iv);

  let encryptedContent = cipher.update(content, 'utf8', 'hex');
  encryptedContent += cipher.final('hex');
  encryptedContent += iv.toString('hex');

  return encryptedContent;
}

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}
  getAllNotes() {
    return this.prisma.note.findMany();
  }

  async getOneNoteByIdAndPassword(id: string, password: string) {
    const note = await this.prisma.note.findUnique({
      where: {
        id,
      },
    });

    if (!note) {
      throw new NoteNotFoundException();
    }

    const isPasswordValid = await bcrypt.compare(password, note.password);

    if (!isPasswordValid) {
      throw new InvalidPasswordException();
    }

    const iv = Buffer.from(note.content.slice(-32), 'hex');
    const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
    const decipher = createCipheriv('aes-256-ctr', key, iv);

    let decrypted = decipher.update(note.content.slice(0, -32), 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return {
      ...note,
      content: decrypted,
    };
  }

  async createNote(title: string, content: string, password: string) {
    //hash password
    const saltOrRounds = 10;
    const salt = await bcrypt.genSalt(saltOrRounds);
    const hashPassword = await bcrypt.hash(password, salt);

    //encrypt content
    const encryptedContent = await EncryptText(content, password);

    return this.prisma.note.create({
      data: {
        title,
        content: encryptedContent,
        password: hashPassword,
      },
    });
  }

  async deleteOneNoteByIdAndPassword(id: string, password: string) {
    const note = await this.prisma.note.findUnique({
      where: {
        id,
      },
    });

    if (!note) {
      throw new NoteNotFoundException();
    }

    const isPasswordValid = await bcrypt.compare(password, note.password);

    if (!isPasswordValid) {
      throw new InvalidPasswordException();
    } else {
      return this.prisma.note.delete({
        where: {
          id,
        },
      });
    }
  }

  async updateOneNoteByIdAndPassword(
    id: string,
    password: string,
    title: string,
    content: string,
  ) {
    const note = await this.prisma.note.findUnique({
      where: {
        id,
      },
    });

    if (!note) {
      throw new NoteNotFoundException();
    }

    const isPasswordValid = await bcrypt.compare(password, note.password);

    if (!isPasswordValid) {
      throw new InvalidPasswordException();
    } else {
      const encryptedContent = await EncryptText(content, password);

      return this.prisma.note.update({
        where: {
          id,
        },
        data: {
          title,
          content: encryptedContent,
        },
      });
    }
  }
}
