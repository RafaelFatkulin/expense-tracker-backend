export class TagsInfoResponse {
  tag: string;
  amount: number;
  color: string;

  static fromWalletEntity({
    tag,
    amount,
    color,
  }: {
    tag: string;
    amount: number;
    color: string;
  }): TagsInfoResponse {
    const response = new TagsInfoResponse();

    response.tag = tag;
    response.amount = amount;
    response.color = color;

    return response;
  }
}
