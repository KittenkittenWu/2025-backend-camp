const { dataSource } = require('../db/data-source')
const logger = require('../utils/logger')('SkillController')

function isUndefined(value) {
  return value === undefined
}

function isNotValidSting(value) {
  return typeof value !== 'string' || value.trim().length === 0 || value === ''
}

// Read：讀取所有技能
class SkillController {
  static async getAll(req, res, next) {
    try {
      const skill = await dataSource.getRepository('Skill').find({ //1. 去資料庫找所有技能
        select: ['id', 'name']
      })
      res.status(200).json({ //2. 將所有技能回傳給前端
        status: 'success',
        data: skill
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  // Create：新增技能
  static async postSkill(req, res, next) {
    try {
      const { name } = req.body //1. 拿到使用者輸入的名稱
      if (isUndefined(name) || isNotValidSting(name)) { //2. 檢查使用者輸入的名稱是否合法
        res.status(400).json({
          status: 'failed',
          message: '欄位未填寫正確'
        })
        return
      }
      const skillRepo = dataSource.getRepository('Skill')
      const existSkill = await skillRepo.find({ //3. 檢查資料庫中是否已存在相同名稱的技能
        where: {
          name
        }
      })
      if (existSkill.length > 0) {
        res.status(409).json({
          status: 'failed',
          message: '資料重複'
        })
        return
      }
      const newSkill = await skillRepo.create({ //4. 建立新的技能
        name
      })
      const result = await skillRepo.save(newSkill) //5. 將新的技能保存到資料庫
      res.status(200).json({
        status: 'success',
        data: result
      })
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }

  // Delete：刪除技能
  static async delete(req, res, next) {
    try {
      const skillId = req.url.split('/').pop() //1. 拿到要刪除的ID
      if (isUndefined(skillId) || isNotValidSting(skillId)) { //2. 檢查ID是否合法
        res.status(400).json({
          status: 'failed',
          message: 'ID錯誤'
        })
        return
      }
      const result = await dataSource.getRepository('Skill').delete(skillId) //3. 刪除技能
      if (result.affected === 0) { //4. 檢查是否成功刪除
        res.status(400).json({
          status: 'failed',
          message: 'ID錯誤'
        })
        return
      }
      res.status(200).json({ //5. 將刪除結果回傳給前端
        status: 'success',
        data: result
      })
      res.end()
    } catch (error) {
      logger.error(error)
      next(error)
    }
  }
}
module.exports = SkillController
