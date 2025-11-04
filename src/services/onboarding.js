export const initOnboarding = async () => {
  try {
    const data = await somePromise();
    return data?.value || null;
  } catch (error) {
    console.error('Onboarding error:', error);
    return null;
  }
}