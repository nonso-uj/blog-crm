const Modal = ({ children }: any) => {
  return (
    <div className="modal-backdrop">
      <div className="info-modal w-4/5 lg:w-1/3">
        { children }
      </div>
    </div>
  );
};

export default Modal;