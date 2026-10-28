import initialData from "../data/dummyData";

const STORAGE_KEY = "kos_data";

const loadData = () => {
  const storeData = localStorage.getItem(STORAGE_KEY);
  if (!storeData) {
    saveData(initialData);
    return initialData;
  }
  return JSON.parse(storeData);
};

export const saveData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const resetData = () => {
  saveData(initialData);
  window.location.reload();
};


export default loadData;