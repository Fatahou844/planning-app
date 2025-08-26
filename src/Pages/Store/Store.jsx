import AddDocumentComponent from "../../Components/AddDocumentComponent";

export default function Store() {
  const handleDocumentCreated = async () => {
    // Ici tu peux par ex :
    // - Mettre à jour ton state `ordersData` ou `events`
    // - Appeler une API
    // - Déclencher un re-render ou recalculer la semaine
  };

  return (
    <>
      <AddDocumentComponent
        onDocumentCreated={handleDocumentCreated}
      ></AddDocumentComponent>
    </>
  );
}
