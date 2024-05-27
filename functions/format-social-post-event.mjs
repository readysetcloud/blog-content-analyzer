import short from 'short-uuid';

export const handler = async (state) => {
  try {
    const messages = state.messages.map(m => {
      return {
        referenceNumber: short.generate(),
        message: m,
        platform: state.platform,
        ...state.campaign && { campaign: state.campaign }
      };
    });

    return { messages };
  } catch (err) {
    console.error(err);
    throw err;
  }
};
