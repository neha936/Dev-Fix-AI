import jwt from 'jsonwebtoken'
import * as githubService from '../services/githubService.js'

export const connectGithub = async (req, res, next) => {
  try {
    // Auth token / cookies / query se userId extract karein
    let userId = req.user?.id || req.query.userId || req.cookies?.userId

    // Fallback: decode JWT token from cookie if userId not directly present
    if (!userId && req.cookies?.token) {
      try {
        const decoded = jwt.verify(
          req.cookies.token,
          process.env.JWT_SECRET || 'devfix_jwt_secret_key_change_in_production'
        )
        if (decoded?.id) {
          userId = decoded.id
        }
      } catch (err) {
        console.warn('[CONNECT GITHUB]: Could not extract userId from cookie token:', err.message)
      }
    }

    if (!userId) {
      console.error('[GITHUB OAUTH CONNECT ERROR]: No userId provided in req.user, req.query, or cookies.')
      return res.status(401).json({
        success: false,
        message: 'User authentication required before connecting GitHub.'
      })
    }

    console.log(`[GITHUB OAUTH CONNECT]: Generating GitHub Auth URL for userId: ${userId}`)
    const authUrl = githubService.getGithubAuthUrl(userId)
    console.log(`[GITHUB OAUTH CONNECT]: Redirecting user to GitHub authorization page...`)
    return res.redirect(authUrl)
  } catch (error) {
    console.error('[GITHUB OAUTH CONNECT ERROR]:', error)
    next(error)
  }
}

export const githubCallback = async (req, res, next) => {
  try {
    const { code, state, error: ghError } = req.query

    console.log(`[GITHUB OAUTH CALLBACK]: Received callback. Code present: ${!!code}, State present: ${!!state}, Error: ${ghError || 'none'}`)

    if (ghError) {
      console.error(`[GITHUB OAUTH CALLBACK]: GitHub returned error: ${ghError}`)
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=${encodeURIComponent(ghError)}`)
    }

    if (!code) {
      console.error('[GITHUB OAUTH CALLBACK]: Missing authorization code')
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=missing_code`)
    }

    console.log('[GITHUB OAUTH CALLBACK]: Handing over code & state to githubService...')
    await githubService.handleGithubCallback(code, state)

    console.log('[GITHUB OAUTH CALLBACK]: GitHub OAuth completed successfully! Redirecting to frontend with ?github=connected')
    // Success redirect back to frontend
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?github=connected`)
  } catch (error) {
    console.error('[GITHUB OAUTH CALLBACK ERROR]:', error.message)
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=${encodeURIComponent(error.message)}`)
  }
}


export const getStatus = async (req, res, next) => {
  try {
    const status = await githubService.getGithubStatus(req.user.id)
    return res.json({ success: true, data: status })
  } catch (error) {
    next(error)
  }
}

export const disconnect = async (req, res, next) => {
  try {
    const result = await githubService.disconnectGithub(req.user.id)
    return res.json({ success: true, ...result })
  } catch (error) {
    next(error)
  }
}

export const getRepos = async (req, res, next) => {
  try {
    const repos = await githubService.getUserRepositories(req.user.id)
    return res.json({ success: true, data: repos })
  } catch (error) {
    next(error)
  }
}

export const getRepoIssues = async (req, res, next) => {
  try {
    const { owner, repo } = req.params
    const issues = await githubService.getRepositoryIssues(req.user.id, owner, repo)
    return res.json({ success: true, data: issues })
  } catch (error) {
    next(error)
  }
}

export const getRepoPulls = async (req, res, next) => {
  try {
    const { owner, repo } = req.params
    const pulls = await githubService.getRepositoryPulls(req.user.id, owner, repo)
    return res.json({ success: true, data: pulls })
  } catch (error) {
    next(error)
  }
}