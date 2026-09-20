export const isValidEmail = (value = '') => {
  const email = value.trim().toLowerCase();
  const strictEmail = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;
  const [localPart, domain] = email.split('@');
  return strictEmail.test(email) && localPart !== 'test' && !['test.com', 'example.com', 'example.org', 'example.net'].includes(domain);
};

export const getAuthErrorMessage = (code) => {
  switch (code) {
    case 'auth/too-many-requests': return 'Çok fazla başarısız deneme yaptınız, lütfen daha sonra tekrar deneyin.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential': return 'Giriş bilgileri hatalı.';
    case 'auth/invalid-email': return 'Geçerli bir e-posta adresi girin.';
    case 'auth/user-disabled': return 'Bu hesap askıya alınmış.';
    case 'auth/email-already-in-use': return 'Bu e-posta adresi zaten kullanımda.';
    case 'auth/weak-password': return 'Şifreniz yeterince güçlü değil.';
    case 'auth/network-request-failed': return 'Ağ bağlantısı kurulamadı. İnternetinizi kontrol edin.';
    default: return 'İşlem tamamlanamadı. Lütfen tekrar deneyin.';
  }
};
