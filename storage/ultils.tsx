import storage from "./init";

export const saveToStorage = (
  key: string,
  data: any,
  expireTime: number
): boolean => {
  let res = false;
  storage
    .save({
      key: key, // Note: Do not use underscore("_") in key!
      data: data,

      // if expires not specified, the defaultExpires will be applied instead.
      // if set to null, then it will never expire.
      expires: expireTime || null,
    })
    .then(() => {
      console.log("Data saved to storage:", key, data);
      res = true; // Data saved successfully
    })
    .catch((error) => {
      console.error("Error saving data to storage:", error);
      res = false; // Error saving data
    });

  return res;
};

export const loadFromStorage = async (key: string): Promise<any> => {
  let res = {};

  await storage
    .load({
      key: key,

      // autoSync (default: true) means if data is not found or has expired,
      // then invoke the corresponding sync method
      autoSync: true,

      // syncInBackground (default: true) means if data expired,
      // return the outdated data first while invoking the sync method.
      // If syncInBackground is set to false, and there is expired data,
      // it will wait for the new data and return only after the sync completed.
      // (This, of course, is slower)
      syncInBackground: true,

      // you can pass extra params to the sync method
      // see sync example below
    })
    .then((ret) => {
      res = { ...ret }; // ret will be the stored data
    //   console.log("Data loaded from storage:", key, res);
    })
    .catch((err) => {
      // any exception including data not found
      // goes to catch()
      res = { ...err };
    });

  return res;
};
