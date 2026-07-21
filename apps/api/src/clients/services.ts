import {
  findContractorCompaniesRepo,
  findCompanyClientsRepo,
  createClientRepo,
  getClientDetailsRepo,
  updateClientRepo,
  deactivateClientRepo,
  addClientAddressRepo,
  updateClientAddressRepo,
  setPrimaryClientAddressRepo,
  deleteClientAddressRepo,
  type ClientFieldsInput,
  type CreateClientInput,
  type AddressInput
} from "./repository.js";

export async function getContractorCompaniesService(userId: string) {
  return findContractorCompaniesRepo(userId);
}

export async function getCompanyClientsService(userId: string, companyId: string) {
  return findCompanyClientsRepo(userId, companyId);
}

export async function createClientService(userId: string, input: CreateClientInput) {
  return createClientRepo(userId, input);
}

export async function getClientDetailsService(userId: string, companyId: string, clientId: string) {
  return getClientDetailsRepo(userId, companyId, clientId);
}

export async function updateClientService(userId: string, clientId: string, input: ClientFieldsInput) {
  return updateClientRepo(userId, clientId, input);
}

export async function deactivateClientService(userId: string, clientId: string, companyId: string) {
  return deactivateClientRepo(userId, clientId, companyId);
}

export async function addClientAddressService(userId: string, clientId: string, input: AddressInput) {
  return addClientAddressRepo(userId, clientId, input);
}

export async function updateClientAddressService(userId: string, clientId: string, addressId: string, input: AddressInput) {
  return updateClientAddressRepo(userId, clientId, addressId, input);
}

export async function setPrimaryClientAddressService(userId: string, companyId: string, clientId: string, addressId: string) {
  return setPrimaryClientAddressRepo(userId, companyId, clientId, addressId);
}

export async function deleteClientAddressService(userId: string, companyId: string, clientId: string, addressId: string) {
  return deleteClientAddressRepo(userId, companyId, clientId, addressId);
}
