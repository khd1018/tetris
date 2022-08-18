const store = {
  setLocalStorage(score) {
    localStorage.setItem("score", score);
  },

  getLocalStorage() {
    const scores = localStorage.getItem("score");
    if (!scores) {
      return 0;
    }
    return scores.split(",").map((v) => v * 1);
  },
};

export default store;
