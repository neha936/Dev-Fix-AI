import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import routes from './routes/index.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

// Security & Cookie Middleware
app.use(helmet({
  contentSecurityPolicy: false // Allow cross-origin redirections for OAuth
}))

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Root-level status routes (no DB access)
app.get('/', (req, res) => res.json({ success: true, message: 'DevFix AI Backend is active' }))
app.get('/health', (req, res) => res.json({ success: true, status: 'healthy' }))

// Mount API Routes
app.use('/api', routes)

// 404 Handler
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
})

// Centralized Error Handler
app.use(errorHandler)

export default app
