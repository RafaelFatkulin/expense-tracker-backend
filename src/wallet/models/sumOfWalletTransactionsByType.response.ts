export class SumOfWalletTransactionsByTypeResponse {
  name: string;
  value: number;

  static fromWalletEntity({
    name,
    value,
  }: {
    name: string;
    value: number;
  }): SumOfWalletTransactionsByTypeResponse {
    const response = new SumOfWalletTransactionsByTypeResponse();

    response.name = name;
    response.value = value ? value : 0;

    return response;
  }
}
