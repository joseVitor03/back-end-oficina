import { Op } from 'sequelize';
import IEmployeeModel from '../interfaces/IEmployeeModel';
import SequelizeEmployee from '../database/models/SequelizeEmployee';
import IEmployee from '../interfaces/databaseModels/IEmployee';
import SequelizeEmployeeServices from '../database/models/SequelizeEmployeeServices';
import SequelizeServices from '../database/models/SequelizeServices';
import SequelizeClient from '../database/models/SequelizeClient';
import SequelizeCar from '../database/models/SequelizeCar';

export default class EmployeeModel implements IEmployeeModel {
  private employeeServices = SequelizeEmployeeServices;

  constructor(private model = SequelizeEmployee) {}
  async removeEmployee(id: number): Promise<number> {
    const result = await this.model.destroy({ where: { id } });
    return result;
  }

  async listEmployees(): Promise<IEmployee[]> {
    const result = await this.model.findAll();
    return result;
  }

  async updateEmployee({ id, name }: IEmployee): Promise<number> {
    const [result] = await this.model.update({ name }, { where: { id } });
    return result;
  }

  async insertEmployee(name: string): Promise<IEmployee> {
    const [result] = await this.model.findOrCreate({ where: { name } });
    return result;
  }

  async employeeProductivityByDate(data: { dateInitial: string; dateFinal: string; id: string }):
  Promise<SequelizeEmployeeServices[]> {
    const result = await this.employeeServices.findAll({
      where: { employeeId: data.id },
      attributes: { exclude: ['employeeId', 'serviceId'] },
      include: [{ model: SequelizeServices,
        as: 'service',
        where: { date: { [Op.between]: [data.dateInitial, data.dateFinal] } },
        attributes: { exclude: ['clientId'] },
        include: [{
          model: SequelizeClient,
          as: 'client',
          attributes: { exclude: ['carId'] },
          include: [{
            model: SequelizeCar, as: 'car',
          }],
        }],
      }, {
        model: SequelizeEmployee, as: 'employee',
      }] });
    return result;
  }
}
