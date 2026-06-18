import axios from 'axios'

const authClient = axios.create({ baseURL: 'http://localhost:8081' })

export interface AuthResponse {
  token: string
  email: string
  name: string | null
}

export interface MeResponse {
  email: string
  name: string | null
}

export async function signupApi(data: {
  email: string
  password: string
  name?: string
}): Promise<AuthResponse> {
  const { data: res } = await authClient.post<AuthResponse>('/api/auth/signup', data)
  return res
}

export async function loginApi(data: {
  email: string
  password: string
}): Promise<AuthResponse> {
  const { data: res } = await authClient.post<AuthResponse>('/api/auth/login', data)
  return res
}

export async function getMeApi(token: string): Promise<MeResponse> {
  const { data } = await authClient.get<MeResponse>('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}

export async function changePasswordApi(
  token: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await authClient.post(
    '/api/auth/change-password',
    { currentPassword, newPassword },
    { headers: { Authorization: `Bearer ${token}` } },
  )
}

export async function forgotPasswordApi(email: string): Promise<void> {
  await authClient.post('/api/auth/forgot-password', { email })
}

export async function resetPasswordApi(token: string, newPassword: string): Promise<void> {
  await authClient.post('/api/auth/reset-password', { token, newPassword })
}

export function extractApiError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error ?? err.message
  }
  return 'Something went wrong'
}
