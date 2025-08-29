/*
  ______             __                      __  __                      __
 /      \           |  \                    |  \|  \                    |  \
|  $$$$$$\ __    __  \$$ ________  ________ | $$ \$$ _______    ______  | $$
| $$  | $$|  \  |  \|  \|        \|        \| $$|  \|       \  /      \ | $$
| $$  | $$| $$  | $$| $$ \$$$$$$$$ \$$$$$$$$| $$| $$| $$$$$$$\|  $$$$$$\| $$
| $$ _| $$| $$  | $$| $$  /    $$   /    $$ | $$| $$| $$  | $$| $$  | $$ \$$
| $$/ \ $$| $$__/ $$| $$ /  $$$$_  /  $$$$_ | $$| $$| $$  | $$| $$__| $$ __
 \$$ $$ $$ \$$    $$| $$|  $$    \|  $$    \| $$| $$| $$  | $$ \$$    $$|  \
  \$$$$$$\  \$$$$$$  \$$ \$$$$$$$$ \$$$$$$$$ \$$| \$$ \$$   \$$ _\$$$$$$$ \$$
      \$$$                                                    |  \__| $$
                                                               \$$    $$
                                                                \$$$$$$

  ===================== DOCUMENTAÇÃO DO SCRIPT =====================

  Script: creator.ts
  Descrição: Contém endpoints para o gerenciamento de quizzes na Quizzling API.
             Permite criar, editar, deletar e alterar visibilidade de quizzes.
             Também fornece listagem de quizzes pertencentes a um criador específico.

  Endpoints contidos:
    - POST   /quizzes           : Criar novo quiz
    - PUT    /quizzes/:id       : Editar quiz existente
    - DELETE /quizzes/:id       : Deletar quiz
    - GET    /quizzes/creator/:creatorId : Listar quizzes do criador
    - PATCH  /quizzes/:id/visibility    : Alterar visibilidade (public/private)

  Última modificação: 29/08/2025
  Escrito por: Crank-DEV

  Observações:
    - Todos os IDs são UUIDs (CHAR(36))
    - Criadores só podem gerenciar seus próprios quizzes
    - Trata erros básicos e retorna JSON padronizado
    - Futuro: incluir validações avançadas e suporte a perguntas/respostas

  ===================== FIM DA DOCUMENTAÇÃO =====================
*/

import { db } from '../../config/db.js';
import { v4 as uuidv4 } from 'uuid';

import type { Request, Response } from 'express';

const QuizCreator = {
    CreateQuiz: async function(req: Request, res: Response) {
        const { title, description, creatorId, visibility } = req.body;

        if (!title || !creatorId) {
            return res.status(400).json({
                code: 400,
                status: 'fail',
                error: 'Title and Creator ID are not optional, and need to be filled properly.'
            });
        }

        const quizid = uuidv4();

        try {
            await db.query(
                'INSERT INTO quizzes (id, title, description, creatorId, visibility) VALUES (?, ?, ?, ?, ?)',
                [quizid, title, description || '', creatorId, visibility || "private"]
            );

            res.status(201).json({
                code: 201,
                status: 'success',
                message: `Quiz '${title}' created successfully!`,
                data: {
                    id: quizid,
                    title: title,
                    description: description,
                    visibility: visibility || "private"
                }
            });
        } catch (error) {
            console.error(`[🔥🚀 QUIZZLING API]: Error on '/api/v1/quizzes/', details: ${error}`);
            return res.status(500).json({ error: "Internal Server Error." });
        }
    },

    EditQuiz: async function(req: Request, res: Response) {
        const { id } = req.params;
        const { title, description, visibility } = req.body;

        try {
            const [result]: any = await db.query(
                'UPDATE quizzes SET title=?, description=?, visibility=? WHERE id=?',
                [title, description, visibility, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ code: 404, status: 'fail', error: 'Quiz not found.' });
            }

            res.json({ code: 200, status: 'success', message: 'Quiz updated successfully.' });
        } catch (error) {
            console.error(`[🔥🚀 QUIZZLING API]: Error on 'PUT /api/v1/quizzes/:id', details: ${error}`);
            return res.status(500).json({ error: "Internal Server Error." });
        }
    },

    DeleteQuiz: async function(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const [result]: any = await db.query('DELETE FROM quizzes WHERE id=?', [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ code: 404, status: 'fail', error: 'Quiz not found.' });
            }

            res.json({ code: 200, status: 'success', message: 'Quiz deleted successfully.' });
        } catch (error) {
            console.error(`[🔥🚀 QUIZZLING API]: Error on 'DELETE /api/v1/quizzes/:id', details: ${error}`);
            return res.status(500).json({ error: "Internal Server Error." });
        }
    },

    ListQuizzesByCreator: async function(req: Request, res: Response) {
        const { creatorId } = req.params;

        try {
            const [quizzes] = await db.query('SELECT * FROM quizzes WHERE creatorId=?', [creatorId]);
            res.json({ code: 200, status: 'success', quizzes });
        } catch (error) {
            console.error(`[🔥🚀 QUIZZLING API]: Error on 'GET /api/v1/quizzes/creator/:creatorId', details: ${error}`);
            return res.status(500).json({ error: "Internal Server Error." });
        }
    },

    ChangeVisibility: async function(req: Request, res: Response) {
        const { id } = req.params;
        const { visibility } = req.body;

        if (!['public', 'private'].includes(visibility)) {
            return res.status(400).json({ code: 400, status: 'fail', error: 'Invalid visibility value.' });
        }

        try {
            const [result]: any = await db.query('UPDATE quizzes SET visibility=? WHERE id=?', [visibility, id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ code: 404, status: 'fail', error: 'Quiz not found.' });
            }

            res.json({ code: 200, status: 'success', message: `Visibility changed to '${visibility}' successfully.` });
        } catch (error) {
            console.error(`[🔥🚀 QUIZZLING API]: Error on 'PATCH /api/v1/quizzes/:id/visibility', details: ${error}`);
            return res.status(500).json({ error: "Internal Server Error." });
        }
    }
};

export default QuizCreator;
