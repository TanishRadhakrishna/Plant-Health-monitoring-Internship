export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password) => {
  return password.length >= 8 &&
         /[a-z]/.test(password) &&
         /[A-Z]/.test(password) &&
         /\d/.test(password) &&
         /[@$!%*?&]/.test(password)
}

export const validateUsername = (username) => {
  return /^[a-zA-Z0-9_]{3,30}$/.test(username)
}

export const getPasswordStrength = (password) => {
  let strength = 0
  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[@$!%*?&]/.test(password)) strength++
  
  if (strength <= 2) return { label: 'Weak', color: 'bg-red-500', width: '33%' }
  if (strength <= 4) return { label: 'Medium', color: 'bg-yellow-500', width: '66%' }
  return { label: 'Strong', color: 'bg-green-500', width: '100%' }
}