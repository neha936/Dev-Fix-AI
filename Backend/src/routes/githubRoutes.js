import express from 'express'
import {
  connectGithub,
  githubCallback,
  getStatus,
  disconnect,
  getRepos,
  getRepoIssues,
  getRepoPulls
} from '../controllers/githubController.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// OAuth Flow Routes - Public endpoints
// Handle both '/' and '/connect' so both /api/github and /api/github/connect function properly
router.get(['/', '/connect'], connectGithub)
router.get('/callback', githubCallback)

// Account & Sync status routes (Protected with JWT)
router.get('/status', protect, getStatus)
router.post('/disconnect', protect, disconnect)
router.get('/repos', protect, getRepos)
router.get('/repos/:owner/:repo/issues', protect, getRepoIssues)
router.get('/repos/:owner/:repo/pulls', protect, getRepoPulls)

export default router