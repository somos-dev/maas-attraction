// lib/modalController.ts

type ModalController = {
  onOpen: () => void;
  onClose: () => void;
};

let controller: ModalController | null = null;

export const setModalController = (c: ModalController) => {
  controller = c;
};

export const getModalController = () => controller;
