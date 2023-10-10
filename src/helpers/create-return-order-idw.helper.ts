import { idWorksApi } from './apis/idw';

export const CreateOrderReturnIDW = async (
  IDOrder: string,
  products: { refId: string; quantity: number }[],
): Promise<any> => {
  let orderIDWReturn = await idWorksApi.post(
    `orders/${IDOrder}/return?IDTypeOrderReturn=27`,
  );

  orderIDWReturn = await idWorksApi.put(
    `/orders/${orderIDWReturn.data[0].IDOrder}`,
    {
      NfeChaveAcessoDevolucao: orderIDWReturn.data[0].NfeChaveAcessoDevolucao,
      NfeExportaUFSaidaPais: orderIDWReturn.data[0].NfeExportaUFSaidaPais,
      NfeExportaxLocExporta: orderIDWReturn.data[0].NfeExportaxLocExporta,
      NfeExportaxLocDespacho: orderIDWReturn.data[0].NfeExportaxLocDespacho,
      ExternalOrderId: orderIDWReturn.data[0].ExternalOrderId,
      IDOrdersCarrierCollectionList:
        orderIDWReturn.data[0].IDOrdersCarrierCollectionList,
      IDPickingList: orderIDWReturn.data[0].IDPickingList,
      Order: orderIDWReturn.data[0].Order,
      NFeFin: orderIDWReturn.data[0].NFeFin,
      NfModFrete: orderIDWReturn.data[0].NfModFrete,
      NFeType: orderIDWReturn.data[0].NFeType,
      NfeindFinal: orderIDWReturn.data[0].NfeindFinal,
      ValueShipping: orderIDWReturn.data[0].ValueShipping,
      NfeAccessoryExpenses: orderIDWReturn.data[0].NfeAccessoryExpenses,
      OrderFrom: orderIDWReturn.data[0].OrderFrom,
      NfeNatureOperation: orderIDWReturn.data[0].NfeNatureOperation,
      IDSalesChannel: orderIDWReturn.data[0].IDSalesChannel,
      OrderComments: orderIDWReturn.data[0].OrderComments,
      IDCarrier: orderIDWReturn.data[0].IDCarrier,
      IDCompanyInvoice: orderIDWReturn.data[0].IDCompanyInvoice,
      NfeComments: orderIDWReturn.data[0].NfeComments,
      NfeCfopPriority: orderIDWReturn.data[0].NfeCfopPriority,
      NfePackages: orderIDWReturn.data[0].NfePackages,
      BalanceChange: orderIDWReturn.data[0].BalanceChange,
      Checked: orderIDWReturn.data[0].Checked,
      NfeFactorPercent: orderIDWReturn.data[0].NfeFactorPercent,
      IDAddressDelivery: orderIDWReturn.data[0].IDAddressDelivery,
      IDAddress: orderIDWReturn.data[0].IDAddress,
      IDOrderType: orderIDWReturn.data[0].IDOrderType,
      IDCompanyIntegration: orderIDWReturn.data[0].IDCompanyIntegration,
      IDConsumer: orderIDWReturn.data[0].IDConsumer,
      NfeNoPayment: 1,
    },
  );

  await Promise.all(
    orderIDWReturn.data[0].Items.map(async (item) => {
      const {
        Comments,
        IDSku,
        IDStockKeepingUnitWarehouse,
        IDTypeFulfillmentNonconformity,
        NfeNItemPed,
        PercentDiscount,
        PriceList,
        PriceSelling,
        QuantityNonconformity,
        ValueDiscount,
      } = item;

      const product = products.find(
        (product) => product.refId === item.IDSkuCompany,
      );

      if (product !== undefined) {
        await idWorksApi.put(
          `/orders/${orderIDWReturn.data[0].IDOrder}/sku/${item.IDSkuMovement}`,
          {
            Comments,
            IDSku,
            IDStockKeepingUnitWarehouse,
            IDTypeFulfillmentNonconformity,
            NfeNItemPed,
            PercentDiscount,
            PriceList,
            PriceSelling,
            Quantity: product.quantity,
            QuantityNonconformity,
            ValueDiscount,
          },
        );
      } else {
        await idWorksApi.delete(
          `/orders/${orderIDWReturn.data[0].IDOrder}/sku/${item.IDSkuMovement}`,
        );
      }
    }),
  );

  orderIDWReturn = await idWorksApi.post(
    `/orders/${orderIDWReturn.data[0].IDOrder}/start-handling`,
  );

  orderIDWReturn = await idWorksApi.post(
    `/orders/${orderIDWReturn.data[0].IDOrder}/invoice`,
  );

  return orderIDWReturn.data[0];
};
